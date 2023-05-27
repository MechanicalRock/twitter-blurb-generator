import {
  CopyleaksAuthToken,
  CopyleaksExportModel,
  ExportResults,
} from "plagiarism-checker";

import { Copyleaks } from "plagiarism-checker/dist/Copyleaks";
import { v4 as uuidv4 } from "uuid";

export class CopyLeaksWrapper {
  private baseAppUrl: string;
  private baseCopyLeaksApiUrl = "https://api.copyleaks.com/v3";
  private copyLeaksLoginUrl = "https://id.copyleaks.com/v3/account/login/api";
  private copyleaks: Copyleaks;
  private accessToken: CopyleaksAuthToken | void = undefined;

  constructor() {
    this.copyleaks = new Copyleaks();
    this.baseAppUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/api`
      : "http://localhost:3000";
  }

  // =======================
  // Public Methods
  // =======================
  /*
    Send a string to Copy Leaks to be analysed for plagiarism
    
    - The webhook will only be called on a deployed public website. ie. Having
      localhost as the webhook domain will not work as localhost will not have a
      publicly accessible IP. 
    - Setting the sandbox property to "true" does not using Copy Leaks credits
      and will return a valid response to the webhook, however the response 
      will contain dummy data.
    - Changing the filters will result in more accurate results but longer
      load times.
    https://api.copyleaks.com/documentation/v3/scans/submit/file
  */
  public async scan(text: string): Promise<string> {
    if (text.length < 2) throw new Error("Text too short to check");
    const scanId = uuidv4();
    const buffer = Buffer.from(text);
    const access_token = await this.getAccessToken();

    try {
      await fetch(`${this.baseCopyLeaksApiUrl}/scans/submit/file/${scanId}`, {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${access_token.access_token}`,
        },
        method: "PUT",
        body: JSON.stringify({
          base64: buffer.toString("base64"),
          filename: `${scanId}.txt`,
          properties: {
            sandbox: this.baseAppUrl == "http://localhost:3000",
            filters: {
              minorChangesEnabled: false,
              relatedMeaningEnabled: false,
              safeSearch: true,
              sensitivityLevel: 1,
            },
            expiration: 1,
            webhooks: {
              status: `${this.baseAppUrl}/copy-leaks/{STATUS}/${scanId}`,
            },
          },
        }),
      });
    } catch (e) {
      console.error("Error submitting scan to CopyLeaks", e);
      throw e;
    }
    return scanId;
  }

  /*
      Request detailed results for a particular scan.

      A scan may return multiple sources where it thinks the plagiarised
      text comes from. This function returns the details of a source and 
      which lines within the source were plagiarised via a webhook.

      - The webhook will only be called on a deployed public website. ie. Having
      localhost as the webhook domain will not work as localhost will not have a
      publicly accessible IP. 
      - The completionWebhook and crawledVersion.endpoint are not used by this 
      application but Copy Leaks force you to have these fields as not null. In
      this case we define a non-existent endpoint.

      https://api.copyleaks.com/documentation/v3/downloads/export
  */
  public async getDetailedResults(
    scanId: string,
    resultId: string
  ): Promise<string> {
    const exportId = uuidv4();
    const resultToExport: ExportResults = {
      id: resultId,
      verb: "POST",
      endpoint: `${this.baseAppUrl}/copy-leaks/export/${scanId}/${resultId}`,
    };
    const request: CopyleaksExportModel = {
      completionWebhook: `${this.baseAppUrl}/fake`,
      results: [resultToExport],
      crawledVersion: {
        endpoint: `${this.baseAppUrl}/fake`,
        verb: "POST",
      },
    };
    const access_token = await this.getAccessToken();

    try {
      await fetch(
        `${this.baseCopyLeaksApiUrl}/downloads/${scanId}/export/${exportId}`,
        {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${access_token.access_token}`,
          },
          method: "POST",
          body: JSON.stringify(request),
        }
      );
    } catch (e) {
      console.error("Error exporting results from CopyLeaks", e);
      throw e;
    }
    return exportId;
  }

  // =======================
  // Private Methods
  // =======================

  /*
    Retrieve a bearer token to allow us to use the Copy Leaks API

    - The environment variable for COPY_LEAKS_EMAIL and COPY_LEAKS_API_KEY
      need to be set before using this method. Details on how to do this 
      can be found in the README.
    
    https://api.copyleaks.com/documentation/v3/account/login
  */
  private async login(): Promise<CopyleaksAuthToken> {
    if (!process.env.COPY_LEAKS_EMAIL) {
      throw new Error("COPY_LEAKS_EMAIL environment variable not set");
    }
    if (!process.env.COPY_LEAKS_API_KEY) {
      throw new Error("COPY_LEAKS_API_KEY environment variable not set");
    }

    const response = await fetch(this.copyLeaksLoginUrl, {
      headers: { "Content-type": "application/json" },
      method: "POST",
      body: JSON.stringify({
        email: process.env.COPY_LEAKS_EMAIL,
        key: process.env.COPY_LEAKS_API_KEY,
      }),
    });
    const result = (await response.json()) as CopyleaksAuthToken;
    return result;
  }

  /*
    Get a valid access token

    - Ensures that the current access token is not expired. If it is
      this function requests a new access token
  */
  private async getAccessToken(): Promise<CopyleaksAuthToken> {
    try {
      if (!this.accessToken) throw new Error("Access token not set");
      this.copyleaks.verifyAuthToken(this.accessToken);
    } catch (error) {
      console.log("Requesting new access token...");
      const newAccessToken = await this.login();
      this.accessToken = newAccessToken;
    } finally {
      if (!this.accessToken) throw new Error("Access token not set");
      return this.accessToken;
    }
  }
}
