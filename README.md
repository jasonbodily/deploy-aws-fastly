# DeployAWSFastly (Project Tobu)

Manages the setup, deploy, and occasional rollback of versioned builds using AWS and Fastly.

## Getting Started

DeployAWSFastly requires a `.deployconfig.json` file to be listed in the root of the project to be deployed. That file should follow the convention of the `.deployconfig.bak.json` example file in the root of this project.

## Deploying
Deployment happens (ideally) in two steps and requires the user to have authorized deploy credentials if remote. Copy the keys file using `cp /deploy/keys.json.bak /deploy/keys.json` and add your authorized keys.

Once your keys are in place, you may run `amazon-fastly-deploy` and `amazon-fastly-assign` in order to deploy to production.  `amazon-fastly-deploy` creates the build and should be pointed at the beta site. Once changes are visually reviewed and approved, they can be quickly made live by using `amazon-fastly-assign`. The specifics of the two commands are here:

### npm run deploy

```npm run deploy```  creates a new build and assigns the selected domain to that build. In order, the deploy command does the following:

 1. **Authorizes deploy** by using the `remote` request data in `.deployconfig.json` to download the configuration from a remote server. If the property `remote` is not included in the file, the `deployconfig.json` file will act as the configuration locally.
 2. **Determines the destination domain** by prompting the user.
 3. **Determines the environment** by prompting the user. Environments cannot be selected for production-only domains
 4. **Resolves current git branch status.** If a production domain is selected, the current branch must be clean and up-to-date.
 5. **Creates the build** by running executing `npm run build`. NOTE: Because build is run here, *building before deploy is not necessary*
 6. **Uploads the build to S3**. Distributions are labelled with the date they were uploaded. Distributions contain environment specific environment configurations and are therefore kept in s3 according to environment.
 7. **Points the domain to the build** and purges the cache to allow browsers to immediately receive the latest updates. This is currently a varnish configuration on Fastly. *NOTE: Until this step, deploy's may be safely exited. Exiting during this step could result in complications with Fastly.*

### npm run assign

```npm run assign``` points a selected domain to an already-existing build. It is most often used 1) to assign a tested build to production, or 2) to rollback to a previous build in the event of emergency. In order, the assign command does the following:
1. **Determines the destination domain** by prompting the user. This is the domain that will be reassigned a build.
2. **Determines the build** by prompting the user. As noted, builds are listed by the date they were created by the deploy command.
3.  **Points the domain to the build** and purges the cache to allow browsers to immediately receive the latest updates. (Same as in step 7 of the deploy)

## Built With

* [Amazon S3](https://aws.amazon.com/sdk-for-node-js/) - The web framework used
* [Fastly](https://www.fastly.com/) - Edge Cloud platform

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
