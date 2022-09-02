import * as cdk from 'aws-cdk-lib';
import { aws_apigateway, aws_lambda, aws_lambda_nodejs, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

import * as path from "path";

export class ApolloLambdaCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const envName = process.env.ENV_NAME || 'dev'

    // Apollo Main Lambda Resolver
    const apolloMainLambda = new aws_lambda_nodejs.NodejsFunction(
      this,
      `userAccountLambdaResolver`,
      {
        description: 'Lambda resolves UserAccount mutations and queries for AppSync',
        entry: path.join(__dirname, './node-lambdas/apollo-handler.lambda.ts'),
        handler: 'handler',
        runtime: aws_lambda.Runtime.NODEJS_16_X,
        timeout: Duration.seconds(55),
        memorySize: 256,
        environment: {
          ENV_NAME: envName,
          // TABLE_NAME: singleDynamoTable.tableName,
        },
        functionName: `apollo-main-lambda-${envName}`,
        architecture: aws_lambda.Architecture.ARM_64,
      }
    );

    // API to Power Apollo
    let restApi = new aws_apigateway.RestApi(
      this,
      `apollo-lambda-backend-api-${envName}`,
      {
        cloudWatchRole: true,
        description: `REST API to handle Apollo Requests`,
        deploy: true,
        deployOptions: {
          loggingLevel: aws_apigateway.MethodLoggingLevel.INFO,
          metricsEnabled: true,
          stageName: envName,
          tracingEnabled: true,
        },
      }
    );

    // root resource
    let graphResource = restApi.root.addResource('graphql')

    // get all buys and sells integration
    let graphIntegration = new aws_apigateway.LambdaIntegration(
      apolloMainLambda
    );
    // get file method
    graphResource.addMethod("ANY", graphIntegration, {
      apiKeyRequired: false,
    });
    graphResource.addCorsPreflight({
      allowOrigins: aws_apigateway.Cors.ALL_ORIGINS,
    })
  }
}
