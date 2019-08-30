package webservice

import (
	"encoding/json"
	"io"
	"net/http"

	"github.com/beati/exchart/exchart-server/domain"
	"github.com/beati/exchart/exchart-server/usecases"
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

func writeJSON(w io.Writer, resp interface{}) error {
	_, err := w.Write([]byte(")]}',\n"))
	if err != nil {
		return err
	}
	if resp != nil {
		var data []byte
		data, err = json.Marshal(resp)
		if err != nil {
			return err
		}
		_, err = w.Write(data)
		if err != nil {
			return err
		}
	} else {
		_, err = w.Write([]byte("{}"))
		if err != nil {
			return err
		}
	}
	return nil
}

func wrap(f func(w http.ResponseWriter, r *http.Request) (interface{}, error)) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		resp, err := f(w, r)
		if err != nil {
			var code int
			switch err {
			case usecases.ErrBadCredentials:
				code = http.StatusUnauthorized
			case domain.ErrNotAllowed:
				code = http.StatusForbidden
			case domain.ErrBadParameters:
				fallthrough
			case domain.ErrAlreadyExists:
				code = http.StatusBadRequest
			case domain.ErrNotFound:
				code = http.StatusNotFound
			default:
				code = http.StatusInternalServerError
			}

			Logger(r).WithField("code", code).Error(err)
			w.WriteHeader(code)
			return
		}

		err = writeJSON(w, resp)
		if err != nil {
			Logger(r).Error(err)
		}
	}
}
