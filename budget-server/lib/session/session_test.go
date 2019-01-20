package session

import (
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"
)

func generatePersistors(path string) ([]Persistor, error) {
	dbFile := os.TempDir() + "/" + path
	_ = os.Remove(dbFile)

	boltPersistor, err := NewBoltPersistor(dbFile)
	if err != nil {
		return nil, err
	}

	memoryPersistor := NewMemoryPersistor()

	return []Persistor{boltPersistor, memoryPersistor}, nil
}

type data struct {
	A int
	B string
}

func TestSession(t *testing.T) {
	persistors, err := generatePersistors("test_session1")
	if err != nil {
		t.Fatal(err)
	}

	for _, p := range persistors {
		m := NewManager("id", time.Hour, p)

		expected := &data{54, "test"}

		rw := httptest.NewRecorder()
		err = m.New(rw, expected)
		if err != nil {
			t.Fatal(err)
		}

		cookie := rw.Header().Get("Set-Cookie")
		if cookie == "" {
			t.Fatalf("Manager.New: no cookie set")
		}

		r := httptest.NewRequest("", "/test", nil)
		d := &data{}
		err = m.Get(r, d)
		if err != ErrNotFound {
			t.Fatalf("Manager.Get: error = %v want %v", err, ErrNotFound)
		}

		r = httptest.NewRequest("", "/test", nil)
		header := http.Header{}
		header.Add("Cookie", cookie)
		r.Header = header
		d = &data{}
		err = m.Get(r, d)
		if err != nil {
			t.Fatal(err)
		}

		if *d != *expected {
			t.Fatalf("Manager.Get: data = %v want %v", d, expected)
		}

		rw = httptest.NewRecorder()
		err = m.Clear(rw, r)
		if err != nil {
			t.Fatal(err)
		}
		if rw.Header().Get("Set-Cookie") == "" {
			t.Fatalf("Manager.Clear: no cookie set")
		}

		d = &data{}
		err = m.Get(r, d)
		if err != ErrNotFound {
			t.Fatalf("Manager.Get: error = %v want %v", err, ErrNotFound)
		}
	}
}

func TestExpired(t *testing.T) {
	s := Session{
		CreationTime: time.Now().Add(-2 * time.Hour),
	}
	if !s.Expired(1 * time.Hour) {
		t.Errorf("Session.Expired = false want true")
	}
	if s.Expired(3 * time.Hour) {
		t.Errorf("Session.Expired = true want false")
	}
}

func TestDeleteExpired(t *testing.T) {
	persistors, err := generatePersistors("test_session2")
	if err != nil {
		t.Fatal(err)
	}

	d := &data{54, "test"}

	for _, p := range persistors {
		expiredID := CreateID()
		expired := &Session{
			CreationTime: time.Now().Add(-4 * time.Hour),
			Value:        d,
		}
		validID := CreateID()
		valid := &Session{
			CreationTime: time.Now().Add(-2 * time.Hour),
			Value:        d,
		}

		err = p.Save(expiredID, expired)
		if err != nil {
			t.Fatal(err)
		}
		err = p.Save(validID, valid)
		if err != nil {
			t.Fatal(err)
		}

		m := NewManager("id", 3*time.Hour, p)
		err = m.deleteExpired()
		if err != nil {
			t.Fatal(err)
		}

		s := Session{
			Value: &data{},
		}
		err = p.Get(expiredID, &s)
		if err != ErrNotFound {
			t.Fatalf("expired session not deleted, error: %v", err)
		}
		err = p.Get(validID, &s)
		if err != nil {
			t.Fatalf("can't retriev valid session, error: %v", err)
		}
	}
}

func BenchmarkBoltNewSession(b *testing.B) {
	dbFile := os.TempDir() + "/bench_new_session"
	_ = os.Remove(dbFile)

	p, err := NewBoltPersistor(dbFile)
	if err != nil {
		b.Fatal(err)
	}

	m := NewManager("id", 3*time.Hour, p)

	data := &struct {
		A int
		B int
	}{54, 34}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		rw := httptest.NewRecorder()
		err = m.New(rw, data)
		if err != nil {
			b.Fatal(err)
		}
	}
}

func BenchmarkMemoryNewSession(b *testing.B) {
	p := NewMemoryPersistor()

	m := NewManager("id", 3*time.Hour, p)

	data := &struct {
		A int
		B int
	}{54, 34}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		rw := httptest.NewRecorder()
		err := m.New(rw, data)
		if err != nil {
			b.Fatal(err)
		}
	}
}

/*
func TestBoltDeleteExpired(t *testing.T) {
	dbFile := os.TempDir() + "/bench_session"
	_ = os.Remove(dbFile)

	p, err := NewBoltPersistor(dbFile)
	if err != nil {
		t.Fatal(err)
	}

	d := &data{54, "test"}

	entryCount := 100
	t1 := time.Now()
	for i := 0; i < entryCount; i++ {
		expiredID := createID()
		expired := &Session{
			CreationTime: time.Now().Add(-4 * time.Hour),
			Value:        d,
		}
		validID := createID()
		valid := &Session{
			CreationTime: time.Now().Add(-2 * time.Hour),
			Value:        d,
		}

		err = p.Save(expiredID, expired)
		if err != nil {
			t.Fatal(err)
		}
		err = p.Save(validID, valid)
		if err != nil {
			t.Fatal(err)
		}
	}
	fmt.Printf("inserting value duration: %v\n", time.Now().Sub(t1))

	m := NewManager("id", 3*time.Hour, p)

	t1 = time.Now()
	err = m.DeleteExpired()
	if err != nil {
		t.Fatal(err)
	}
	fmt.Printf("delete expired duration: %v\n", time.Now().Sub(t1))
}

func BenchmarkBoltDeleteExpired(b *testing.B) {
	b.N = 1

	dbFile := os.TempDir() + "/bench_session"
	_ = os.Remove(dbFile)

	p, err := NewBoltPersistor(dbFile)
	if err != nil {
		b.Fatal(err)
	}

	d := &data{54, "test"}

	entryCount := 100
	for i := 0; i < entryCount; i++ {
		expiredID := createID()
		expired := &Session{
			CreationTime: time.Now().Add(-4 * time.Hour),
			Value:        d,
		}
		validID := createID()
		valid := &Session{
			CreationTime: time.Now().Add(-2 * time.Hour),
			Value:        d,
		}

		err = p.Save(expiredID, expired)
		if err != nil {
			b.Fatal(err)
		}
		err = p.Save(validID, valid)
		if err != nil {
			b.Fatal(err)
		}
	}
	b.Log("Value added")

	m := NewManager("id", 3*time.Hour, p)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		err = m.DeleteExpired()
		if err != nil {
			b.Fatal(err)
		}
	}
}
*/
