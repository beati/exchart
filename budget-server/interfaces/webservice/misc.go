package webservice

import (
	"encoding/json"
	"io"
	"net/http"

	"bitbucket.org/beati/budget/budget-server/domain"
	"bitbucket.org/beati/budget/budget-server/usecases"
)

type contextKey struct {
	name string
}

func contentTypeJSON(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		h.ServeHTTP(w, r)
	})
}

// SecurityHeaders is a middleware that adds security headers to http responses.
func SecurityHeaders(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Strict-Transport-Security", "max-age=315360000; includeSubDomains; preload")
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-XSS-Protection", "1; mode=block")
		w.Header().Set("X-Frame-Options", "deny")
		h.ServeHTTP(w, r)
	})
}

func writeJSON(w io.Writer, resp interface{}) {
	_, _ = w.Write([]byte(")]}',\n"))
	if resp != nil {
		data, err := json.Marshal(resp)
		if err != nil {
			panic(err)
		}
		_, _ = w.Write(data)
	} else {
		_, _ = w.Write([]byte("{}"))
	}
}

func wrap(f func(w http.ResponseWriter, r *http.Request) (interface{}, error)) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var code int
		resp, err := f(w, r)
		switch err {
		case nil:
			writeJSON(w, resp)
			return
		case usecases.ErrBadCredentials:
			code = http.StatusUnauthorized
		case domain.ErrNotAllowed:
			code = http.StatusForbidden
		case domain.ErrBadParameters:
			code = http.StatusBadRequest
		default:
			code = http.StatusInternalServerError
		}
		Logger(r).WithField("code", code).Error(err)
		w.WriteHeader(code)
	}
}
