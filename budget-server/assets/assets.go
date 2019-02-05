package assets

import (
	"net/http"
	"path"
	"strings"

	"github.com/shurcooL/httpgzip"

	"bitbucket.org/beati/budget/budget-server/assets/data"
)

const (
	defaultSrc = "default-src 'none'"
	scriptSrc  = "script-src 'self'" + devUnsafeEval
	styleSrc   = "style-src 'self' fonts.googleapis.com 'unsafe-inline'"
	imgSrc     = "img-src 'self'"
	connectSrc = "connect-src 'self'"
	fontSrc    = "font-src 'self' fonts.gstatic.com"
	cspHeader  = defaultSrc + "; " + scriptSrc + "; " + styleSrc + ";" + imgSrc + ";" + connectSrc + ";" + fontSrc + ";"
)

type assetHandler struct {
	handler    http.Handler
	indexPaths map[string]struct{}
}

func (h assetHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	_, index := h.indexPaths[r.URL.Path]
	if index {
		r.URL.Path = "/"
		w.Header().Set("Content-Security-Policy", cspHeader)
		w.Header().Set("Referrer-Policy", "no-referrer")
	} else {
		file := strings.TrimPrefix(r.URL.Path, "/static/")
		r.URL.Path = file

		ext := path.Ext(file)
		contentType, ok := contentTypes[ext]
		if !ok {
			w.WriteHeader(http.StatusNotFound)
			return
		}
		w.Header().Set("Content-Type", contentType)

		w.Header().Set("Cache-Control", "public, max-age=315360000")
	}
	h.handler.ServeHTTP(w, r)
}

// Handler is a http.Handler that serve static assets of the application client.
func Handler(indexPaths ...string) http.Handler {
	paths := make(map[string]struct{})
	for _, path := range indexPaths {
		paths[path] = struct{}{}
	}

	var fileServer http.Handler
	if dev {
		fileServer = http.FileServer(data.Files)
	} else {
		fileServer = httpgzip.FileServer(data.Files, httpgzip.FileServerOptions{
			IndexHTML: true,
		})
	}

	return &assetHandler{
		handler:    fileServer,
		indexPaths: paths,
	}
}

var contentTypes = map[string]string{
	".html":  "text/html",
	".css":   "text/css",
	".js":    "application/javascript",
	".map":   "application/json",
	".gz":    "application/gzip",
	".json":  "application/json",
	".xml":   "application/xml",
	".woff":  "font/woff",
	".woff2": "font/woff2",
	".png":   "image/png",
	".jpg":   "image/jpeg",
	".svg":   "image/svg+xml",
	".wav":   "audio/wav",
	".m4a":   "audio/mp4",
}
