import core = require("@aws-cdk/core");
import s3 = require('@aws-cdk/aws-s3');
import route53 = require("@aws-cdk/aws-route53")
import { CloudFrontTarget } from "@aws-cdk/aws-route53-targets";
import { CloudFrontWebDistribution } from '@aws-cdk/aws-cloudfront'
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';

const deploymentVersion = "1.0.0"
const certificateArn = "arn:aws:acm:us-east-1:175262026713:certificate/c5001ab9-c535-428d-af8e-802162b111ba"
const domainName = "tcreeds.io"
const siteDomain = "dotatimer.tcreeds.io"

export class DotaTimerUI extends core.Construct {
  constructor(scope: core.Construct, id: string) {
    super(scope, id);

    const websiteBucket = new s3.Bucket(this, 'dotatimer.tcreeds.io', {
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      bucketName: "dotatimer.tcreeds.io",
      publicReadAccess: true
    });
    websiteBucket.grantPublicAccess()

    const s3Deployment = new BucketDeployment(this, 'DeployDotaTimerUI', {
      sources: [Source.asset('../dist')],
      destinationBucket: websiteBucket
    })

    const distribution = new CloudFrontWebDistribution(this, 'cdk-dotatimer-cfront', {
      defaultRootObject: "index.html",
      errorConfigurations: [{
        errorCode: 403,
        responseCode: 200,
        responsePagePath: "/"
      }],
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: websiteBucket
          },
          behaviors : [ {isDefaultBehavior: true}]
        }
      ],
      aliasConfiguration: {
        acmCertRef: certificateArn,
        names: [siteDomain]
      }
    });

    const zone = route53.HostedZone.fromLookup(this, 'Zone', { domainName });

    new route53.ARecord(this, 'SiteAliasRecord', {
      recordName: siteDomain,
      target: route53.AddressRecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      zone
  });
  }
}