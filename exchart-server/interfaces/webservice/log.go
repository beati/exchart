package webservice

import (
	"context"
	"net/http"
	"runtime/debug"
	"time"

	"github.com/go-chi/chi/middleware"
	"github.com/sirupsen/logrus"
)

// LogMiddleware is a middleware that logs every http request and adds logging capability to handlers.
func LogMiddleware(logger *logrus.Logger) func(http.Handler) http.Handler {
	return func(h http.Handler) http.Handler {
		return &logHandler{
			handler: h,
			logger:  logger,
		}
	}
}

// SetLoggerField adds a field to the http request logger.
func SetLoggerField(r *http.Request, key string, value interface{}) {
	l := getLogger(r)
	l.logger = l.logger.WithField(key, value)
}

// SetLoggerFields adds fields to the http request logger.
func SetLoggerFields(r *http.Request, fields logrus.Fields) {
	l := getLogger(r)
	l.logger = l.logger.WithFields(fields)
}

// Logger returns the http request associated logger.
func Logger(r *http.Request) logrus.FieldLogger {
	return getLogger(r).logger
}

type logHandler struct {
	handler http.Handler
	logger  *logrus.Logger
}

func (h *logHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	reqID := middleware.GetReqID(r.Context())

	geoloc := r.Header.Get("CF-IPCountry")
	if geoloc == "" {
		geoloc = "XX"
	}

	h.logger.WithFields(logrus.Fields{
		"request_id":  reqID,
		"remote_addr": r.RemoteAddr,
		"geoloc":      geoloc,
		"user_agent":  r.Header.Get("User-Agent"),
		"method":      r.Method,
		"proto":       r.Proto,
		"host":        r.Host,
		"url":         r.URL.String(),
	}).Info("Incoming request")

	t := time.Now()

	h.handler.ServeHTTP(w, r.WithContext(newContextWithLogger(r.Context(), &loggerContext{h.logger})))

	elapsed := time.Since(t)

	h.logger.WithFields(logrus.Fields{
		"request_id": reqID,
		"elapsed":    elapsed / time.Microsecond,
	}).Info("Response complete")
}

type loggerContext struct {
	logger logrus.FieldLogger
}

var loggerContextKey = &contextKey{"logger"}

func newContextWithLogger(ctx context.Context, logger *loggerContext) context.Context {
	return context.WithValue(ctx, loggerContextKey, logger)
}

func getLogger(r *http.Request) *loggerContext {
	return r.Context().Value(loggerContextKey).(*loggerContext)
}

// RecoverMiddleware is a middleware that recover panic from http handlers and log them.
func RecoverMiddleware(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				code := http.StatusInternalServerError
				Logger(r).WithFields(logrus.Fields{
					"code":  code,
					"stack": string(debug.Stack()),
				}).Error(err)
				w.WriteHeader(code)
			}
		}()

		h.ServeHTTP(w, r)
	})
}
