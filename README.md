# Serverless Contact Form Application

A fully serverless contact form application built with AWS services including Lambda, API Gateway, DynamoDB, S3, and SES. The application features automated email notifications and continuous deployment via GitHub Actions.

## 🏗️ Architecture

This application uses the following AWS services:

- **AWS Lambda** - Processes contact form submissions
- **API Gateway** - Provides REST API endpoints
- **DynamoDB** - Stores contact form data
- **S3** - Hosts static website files
- **SES (Simple Email Service)** - Sends email notifications
- **CloudFormation** - Infrastructure as Code
- **IAM** - Security and access management

## 📁 Project Structure

```
serverless-app/
├── README.md
├── cloudformation/
│   └── contact-template.yaml      # CloudFormation template
├── frontend/
│   ├── index.html                 # Main HTML page
│   ├── script.js                  # Frontend JavaScript
│   └── styles.css                 # CSS styling
├── lambda/
│   └── index.py                   # Lambda function code
└── .github/
    └── workflows/
        └── deploy.yml             # GitHub Actions deployment
```

## 🚀 Quick Start

### Prerequisites

- AWS CLI configured with appropriate permissions
- AWS account with SES configured for your sender email
- GitHub repository (for CI/CD)

### 1. Deploy Infrastructure

```bash
# Clone the repository
git clone <your-repo-url>
cd serverless-app

# Deploy CloudFormation stack
aws cloudformation create-stack \
  --stack-name contactform-stack \
  --template-body file://cloudformation/contact-template.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameters \
    ParameterKey=ApplicationName,ParameterValue=contactform \
    ParameterKey=SenderEmail,ParameterValue=your-verified@email.com \
    ParameterKey=ReceiverEmail,ParameterValue=your-receiver@email.com
```

### 2. Configure GitHub Actions (Optional)

If you want automated deployments:

1. Get the access keys from CloudFormation outputs:
```bash
aws cloudformation describe-stacks \
  --stack-name contactform-stack \
  --query 'Stacks[0].Outputs[?OutputKey==`GitHubActionsAccessKeyId` || OutputKey==`GitHubActionsSecretAccessKey`]'
```

2. Add these to GitHub repository secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

### 3. Access Your Application

Get the website URL and API endpoint:
```bash
aws cloudformation describe-stacks \
  --stack-name contactform-stack \
  --query 'Stacks[0].Outputs[?OutputKey==`WebsiteURL` || OutputKey==`ApiEndpoint`]'
```

## 📧 Email Configuration

### Important: SES Setup Required

Before the application can send emails, you must:

1. **Verify your sender email** in AWS SES Console
2. **Request production access** if sending to unverified emails
3. **Configure SES in the correct region** (default: eu-west-1)

### SES Verification Steps:
1. Go to AWS SES Console → Verified identities
2. Click "Create identity" → Email address
3. Enter your sender email and verify via the confirmation email

## 🔧 Configuration

### CloudFormation Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `ApplicationName` | Base name for all resources | `contactform` |
| `SenderEmail` | Verified SES email for sending | `evamariaarroyo@gmail.com` |
| `ReceiverEmail` | Email to receive contact forms | `yotaka.johansson@hotmail.com` |

### Environment Variables

The Lambda function uses these environment variables (auto-configured):
- `TABLE_NAME` - DynamoDB table name
- `SENDER_EMAIL` - Verified sender email
- `OWNER_EMAIL` - Email to receive notifications

## 🛠️ Development

### Local Development

1. **Modify frontend files** in the `frontend/` directory
2. **Update Lambda code** in `lambda/index.py`
3. **Test locally** or deploy changes via GitHub Actions

### Manual Deployment

Update Lambda function:
```bash
cd lambda
zip function.zip index.py
aws lambda update-function-code \
  --function-name contactform-handler \
  --zip-file fileb://function.zip
```

Update frontend:
```bash
aws s3 sync frontend/ s3://your-bucket-name
```

## 📋 API Documentation

### POST /submit

Submit a contact form.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello, this is a test message."
}
```

**Response:**
```json
{
  "message": "Success",
  "timestamp": "2025-10-14T12:34:56.789Z"
}
```

## 🔒 Security Features

- **CORS enabled** for cross-origin requests
- **IAM roles** with least-privilege access
- **Input validation** for email addresses
- **Separate GitHub Actions user** with limited permissions

## 📊 Monitoring

### CloudWatch Logs
- Lambda execution logs: `/aws/lambda/contactform-handler`
- API Gateway logs: Available in CloudWatch

### DynamoDB
- View submitted contact forms in the DynamoDB console
- Table name: `contactform-contactform`

## 🚨 Troubleshooting

### Common Issues

1. **Email not sending**
   - Verify sender email in SES
   - Check SES sending limits
   - Ensure correct AWS region

2. **CORS errors**
   - Verify API Gateway CORS configuration
   - Check frontend API endpoint URL

3. **GitHub Actions failing**
   - Verify AWS credentials in GitHub secrets
   - Check IAM permissions for GitHub Actions user

4. **Stack recreation**
   - Delete old stack completely before recreating
   - Update GitHub secrets with new access keys after recreation

### Logs and Debugging

```bash
# Check CloudFormation stack status
aws cloudformation describe-stacks --stack-name contactform-stack

# View Lambda logs
aws logs describe-log-groups --log-group-name-prefix /aws/lambda/contactform

# Test API endpoint
curl -X POST https://your-api-id.execute-api.eu-west-1.amazonaws.com/prod/submit \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test message"}'
```

## 🗑️ Cleanup

To delete all resources:

```bash
aws cloudformation delete-stack --stack-name contactform-stack
```

**Note:** This will permanently delete all data in DynamoDB and S3.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Need help?** Check the troubleshooting section or open an issue in the repository.
