
set -x
set -e

cd ../web

aws cloudformation deploy --template-file ../infrastructure/web.yml --stack-name kegshow-web-prd --parameter-overrides "DomainName=kegshow.com"

DISTRIBUTION_ID=$(aws cloudformation describe-stacks --stack-name kegshow-web-prd --output text --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue | [0]")
BUCKET_NAME=$(aws cloudformation describe-stacks --stack-name kegshow-web-prd --output text --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue | [0]")

npm run build ./main.js
aws s3 sync ./dist "s3://${BUCKET_NAME}"

aws cloudfront create-invalidation --distribution-id "${DISTRIBUTION_ID}" --paths /\* --no-cli-pager
