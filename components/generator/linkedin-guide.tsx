"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Steps, Step } from "@/components/ui/steps"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ExternalLink, Copy, AlertCircle, CheckCircle } from "lucide-react"

export function LinkedinGuide() {
  const [copiedText, setCopiedText] = React.useState<string | null>(null)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(text)
    setTimeout(() => setCopiedText(null), 2000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>LinkedIn Integration Guide</CardTitle>
          <CardDescription>
            Follow these steps to connect your LinkedIn Company Page and enable automatic posting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Steps>
            <Step title="Create a LinkedIn Developer Account">
              <p className="text-sm text-muted-foreground mb-4">
                Visit the LinkedIn Developer Portal to create or access your developer account.
              </p>
              <Button variant="outline" asChild>
                <a
                  href="https://www.linkedin.com/developers/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  Open Developer Portal
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </Step>

            <Step title="Create a New App">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  1. Click "Create App" in the Developer Portal
                </p>
                <p className="text-sm text-muted-foreground">
                  2. Fill in the required information:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 ml-4">
                  <li>App name (e.g., "Content Generator")</li>
                  <li>LinkedIn Page to associate with the app</li>
                  <li>App logo (you can use your company logo)</li>
                  <li>Legal agreement acceptance</li>
                </ul>
              </div>
            </Step>

            <Step title="Configure OAuth 2.0 Settings">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Add the following OAuth 2.0 scopes to your application:
                </p>
                <div className="space-y-2">
                  {[
                    'r_organization_social',
                    'rw_organization_social',
                    'w_member_social'
                  ].map((scope) => (
                    <div
                      key={scope}
                      className="flex items-center justify-between p-2 bg-muted rounded-md"
                    >
                      <code className="text-sm">{scope}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(scope)}
                      >
                        {copiedText === scope ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </Step>

            <Step title="Get Your Organization ID">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Your Organization ID is found in your LinkedIn Company Page URL:
                </p>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Example URL</AlertTitle>
                  <AlertDescription className="font-mono text-sm">
                    https://www.linkedin.com/company/<span className="text-primary">12345678</span>
                  </AlertDescription>
                </Alert>
                <p className="text-sm text-muted-foreground">
                  The number after "/company/" is your Organization ID
                </p>
              </div>
            </Step>

            <Step title="Generate Access Token">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  In your app's Auth settings:
                </p>
                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2">
                  <li>Go to the "Auth" tab in your app settings</li>
                  <li>Find the "Client ID" and "Client Secret"</li>
                  <li>Use the OAuth 2.0 tools to generate an access token</li>
                  <li>Make sure to select all required scopes</li>
                </ol>
                <Alert variant="warning">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    Store your access token securely. It will be used to authenticate all API requests.
                  </AlertDescription>
                </Alert>
              </div>
            </Step>

            <Step title="Enter Credentials">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enter the following credentials in the LinkedIn Integration form:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                  <li>Client ID (from Auth settings)</li>
                  <li>Client Secret (from Auth settings)</li>
                  <li>Access Token (generated in previous step)</li>
                  <li>Organization ID (from Company Page URL)</li>
                </ul>
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Ready to Connect</AlertTitle>
                  <AlertDescription>
                    Once you've entered all credentials, click "Connect LinkedIn" to verify and save your settings.
                  </AlertDescription>
                </Alert>
              </div>
            </Step>
          </Steps>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting</CardTitle>
          <CardDescription>
            Common issues and their solutions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Invalid Credentials Error</h4>
              <p className="text-sm text-muted-foreground">
                Make sure all credentials are copied correctly and the access token hasn't expired.
                Generate a new access token if necessary.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Posts Not Publishing</h4>
              <p className="text-sm text-muted-foreground">
                Verify that your app has the correct permissions and your access token includes the
                required scopes. Check the post status in the Schedule view for specific error messages.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Analytics Not Showing</h4>
              <p className="text-sm text-muted-foreground">
                LinkedIn analytics may take a few hours to update. Make sure your access token
                hasn't expired and includes the r_organization_social scope.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 