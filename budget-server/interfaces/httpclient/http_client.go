package httpclient

import (
	"context"
	"net/http"
	"net/url"
	"strings"
)

// PostForm is like http.PostForm but with context.
func PostForm(ctx context.Context, url string, data url.Values) (resp *http.Response, err error) {
	req, err := http.NewRequest("POST", url, strings.NewReader(data.Encode()))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req = req.WithContext(ctx)

	return http.DefaultClient.Do(req)
}
