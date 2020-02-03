#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { AwsCdkStack } from '../lib/aws-cdk-stack';

const app = new cdk.App();
new AwsCdkStack(app, 'DotaTimerUICDKStack', {
    env: {
        region: 'us-east-1',
        account: '175262026713' 
    } 
});
