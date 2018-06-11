





bundles:
	browserify ./web/static/monitor.js --s monitor -o ./web/static/monitor_bundle.js

deploy-web:
	cp ./web/static/constants.test.js ./web/static/constants.js
	aws s3 sync ./web s3://test.kegshow.com --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers --cache-control no-cache,max-age=0

deploy-web-prod:
	cp ./web/static/constants.prod.js ./web/static/constants.js
	aws s3 sync ./web s3://kegshow.com
	aws cloudfront create-invalidation --distribution-id E2CQCOKDDXZWIC --paths *
