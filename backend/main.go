package main

import (
	"log"
	"net/http"
	"os"
)

func main() {
	dbPath := envOr("DATABASE_PATH", "./data/pastes.db")
	port := envOr("PORT", "8080")

	store, err := NewStore(dbPath)
	if err != nil {
		log.Fatalf("open store: %v", err)
	}
	defer func() { _ = store.Close() }()

	srv := &Server{store: store}

	addr := ":" + port
	log.Printf("listening on %s (db: %s)", addr, dbPath)
	if err := http.ListenAndServe(addr, srv.Routes()); err != nil {
		log.Fatalf("server: %v", err)
	}
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
