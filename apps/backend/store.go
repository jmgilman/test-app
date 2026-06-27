package main

import (
	"database/sql"
	"errors"
	"os"
	"path/filepath"
	"strings"
	"time"

	_ "modernc.org/sqlite"
)

// ErrNotFound is returned when a paste does not exist.
var ErrNotFound = errors.New("paste not found")

// Store persists pastes in a SQLite database.
type Store struct {
	db *sql.DB
}

// NewStore opens (and initializes) the SQLite database at path.
func NewStore(path string) (*Store, error) {
	if dir := filepath.Dir(path); dir != "" {
		if err := os.MkdirAll(dir, 0o755); err != nil {
			return nil, err
		}
	}

	db, err := sql.Open("sqlite", path)
	if err != nil {
		return nil, err
	}

	if _, err := db.Exec(`PRAGMA journal_mode=WAL`); err != nil {
		db.Close()
		return nil, err
	}

	if _, err := db.Exec(`CREATE TABLE IF NOT EXISTS pastes (
		id TEXT PRIMARY KEY,
		title TEXT NOT NULL DEFAULT '',
		content TEXT NOT NULL,
		created_at TEXT NOT NULL
	)`); err != nil {
		db.Close()
		return nil, err
	}

	return &Store{db: db}, nil
}

// Close releases the underlying database handle.
func (s *Store) Close() error {
	return s.db.Close()
}

// Create stores a new paste, generating a unique id and timestamp.
func (s *Store) Create(title, content string) (Paste, error) {
	p := Paste{
		Title:     title,
		Content:   content,
		CreatedAt: time.Now().UTC().Format(time.RFC3339),
	}

	for attempts := 0; attempts < 5; attempts++ {
		id, err := newID()
		if err != nil {
			return Paste{}, err
		}

		_, err = s.db.Exec(
			`INSERT INTO pastes (id, title, content, created_at) VALUES (?, ?, ?, ?)`,
			id, p.Title, p.Content, p.CreatedAt,
		)
		if err != nil {
			if isUniqueViolation(err) {
				continue
			}
			return Paste{}, err
		}

		p.ID = id
		return p, nil
	}

	return Paste{}, errors.New("failed to generate a unique id")
}

// Get returns the paste with the given id, or ErrNotFound.
func (s *Store) Get(id string) (Paste, error) {
	var p Paste
	err := s.db.QueryRow(
		`SELECT id, title, content, created_at FROM pastes WHERE id = ?`,
		id,
	).Scan(&p.ID, &p.Title, &p.Content, &p.CreatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return Paste{}, ErrNotFound
	}
	if err != nil {
		return Paste{}, err
	}
	return p, nil
}

// isUniqueViolation reports whether err is a SQLite primary-key collision.
func isUniqueViolation(err error) bool {
	return err != nil && strings.Contains(err.Error(), "UNIQUE constraint failed")
}
