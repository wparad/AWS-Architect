# AWS Architect
It should be easy, and it also should be automated. But both of those things usually aren't free.  The ideal world has magic AI which can communicate with each other.  And to such a degree which doesn't require software architects to think about what the global picture is before an organization can deliver something of value.  The AWS Architect, attempts to eliminate the burden of projecting your vision of software to AWS.  AWS Architects your service using [Microservices](./docs/microservices/index.md).

[![npm version](https://badge.fury.io/js/aws-architect.svg)](https://badge.fury.io/js/aws-architect)
[![Build Status](https://travis-ci.org/wparad/aws-architect.js.svg?branch=master)](https://travis-ci.org/wparad/aws-architect.js)

## Usage

### Creating microservice: `init`
This will also configure your aws account to allow your build system to automatically deploy to AWS. Run locally

* Create git repository and clone locally
* `npm install aws-architect -g`
* `aws-architect init`
* `npm install`
* Update:
	* `package.json`: package name, the package name is used to name your resources
	* `make.js`: API Gateway, Lambda, S3, DynamoDB, and IAM configuration. Contains abstract configuration to drive the publish command to match your service requirements.

#### API Sample
Using `openapi-factory` we can create a declarative api to run inside the lambda function.

```javascript
	let aws = require('aws-sdk');
	let Api = require('openapi-factory');
	let api = new Api();
	module.exports = api;

	api.get('/sample', (request) => {
		return {'Value': 1};
	});
```

##### Lambda with no API sample
Additionally, `openapi-factory` is not required, and executing the lambda handler directly can be done as well.

```javascript
	exports.handler = (event, context, callback) => {
		console.log(`event: ${JSON.stringify(event, null, 2)}`);
		console.log(`context: ${JSON.stringify(context, null, 2)}`);
		callback(null, {Event: event, Context: context});
	};
```
##### Set a custom authorizer
In some cases authorization is necessary. Cognito is always an option, but for more fine grained control, your lambda can double as an authorizer.

```javascript
	api.SetAuthorizer((authorizationTokenInfo, methodArn) => {
		return {
			principalId: 'computed-authorized-principal-id',
			policyDocument: {
				Version: '2012-10-17',
				Statement: [
					{
						Action: 'execute-api:Invoke',
						Effect: 'Deny',
						Resource: methodArn //'arn:aws:execute-api:*:*:*'
					}
				]
			}
		}
	});
```

### Library Functions
#### AwsArchitect class functions

```javascript
let packageMetadataFile = path.join(__dirname, 'package.json');
let packageMetadata = require(packageMetadataFile);

let apiOptions = {
	sourceDirectory: path.join(__dirname, 'src'),
	description: 'This is the description of the lambda function',
	regions: ['eu-west-1'],
	runtime: 'nodejs6.10',
	useCloudFormation: true,
	memorySize: 128,
	publish: true,
	timeout: 3,
	securityGroupIds: [],
	subnetIds: []
};
let contentOptions = {
	bucket: 'WEBSITE_BUCKET_NAME',
	contentDirectory: path.join(__dirname, 'content')
};
let awsArchitect = new AwsArchitect(packageMetadata, apiOptions, contentOptions);

// Create the api gateway from an openapi enabled index.js file
GetApiGatewayPromise() {...}

// Package a directory in a zip archive and deploy to an S3 bucket
let options = {
	bucket: 'BUCKET_NAME'
};
PublishLambdaArtifactPromise(options = {}) {...}

// Create a lambda with the directory code and the api gateway
PublishPromise() {...}

// Validate a cloud formation stack template
ValidateTemplate(stackTemplate) {...}

// deploy a cloud formation stack template
let stackConfiguration = {
	stackName: 'STACK_NAME'
	changeSetName: 'NAME_OF_CHANGE_SET'
};
let parameters = { /** PARAMATERS_FOR_YOUR_TEMPLATE, but also include these unless being overwritten in your template */
	serviceName: packageMetadata.name,
	serviceDescription: packageMetadata.description,
	dnsName: packageMetadata.name
};
DeployTemplate(stackTemplate, stackConfiguration, parameters) {...}

// Create a stage in an api gateway pointing to a specific version of the lambda function
DeployStagePromise(stage, lambdaVersion) {...}

// Calls `PublishPromise` and then `DeployStagePromise`
PublishAndDeployPromise(stage) {...}

// Creates a website, see below
PublishWebsite(version, optionsIn) {...}

// Debug the running service on port at http://localhost:port/api
Run(port) {...}

```

#### S3 Website Deployment
AWS Architect has the ability to set up and configure an S3 bucket for static website hosting. It provides a mechanism as well to deploy your content files directly to S3.
Specify `bucket` in the configuration options for `contentOptions`, and configure the `PublishWebsite` function in the make.js file.

```javascript
	awsArchitect.PublishWebsite('deadc0de-1', options)
	.then((result) => console.log(`${JSON.stringify(result, null, 2)}`))
	.catch((failure) => console.log(`Failed to upload website ${failure} - ${JSON.stringify(failure, null, 2)}`));

	awsArchitect.PromoteToStage('deadc0de-1', 'production')
	.then((result) => console.log(`${JSON.stringify(result, null, 2)}`))
	.catch((failure) => console.log(`Failed copying stage to production ${failure} - ${JSON.stringify(failure, null, 2)}`));
```

##### Website publish options
Publishing the website has an `options` object which defaults to:
```
{
	// setting to false will assume the bucket is correctly configured.
	configureBucket: true,
	
	// provide overrides for paths to change bucket cache control policy, default 600 seconds,
	cacheControlRegexMap: {
		'index.html': 10,
		default: 600
	}
}
```
## Built-in functionality

* conventioned based static S3 website using the `/content` directory
* conventioned based lambda functions.
* Creates a ServiceRole to execute Lambda functions.
* Lambda/API Gateway setup for seemless integration.
* Automatic creation of AWS resources when using including:
	* Lambda functions
	* API Gateway resources
	* Environments for managing resources in AWS
	* IAM service roles
	* S3 Buckets and directorys
	* S3 static website hosting
* Developer testing platform, to run lambdas and static content as a local express Node.js service, to test locally.

### Service Configuration
See [template service documentation](./bin/template/README.md) for how individual parts of the service are configured.

## Also

### AWS Documentation

* [Lambda](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Lambda.html)
* [Node SDK](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html)