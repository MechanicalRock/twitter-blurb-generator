import { Database, getDatabase, ref } from "firebase/database";

import { initializeApp } from "firebase/app";

export class FirebaseWrapper {
  private database?: Database;

  public getScanReference(scanId: string) {
    return ref(this.getInstance(), `scans/${scanId}`);
  }

  private getInstance(): Database {
    if (!this.database) {
      const firebaseConfig = {
        databaseURL: `${process.env.NEXT_PUBLIC_FIREBASE_REALTIME_DATABASE_URL}`,
      };
      const app = initializeApp(firebaseConfig);
      this.database = getDatabase(app);
    }

    return this.database;
  }
}
