import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  User: a
    .model({
      // Primary key
      userId: a.id(),
      email: a.string().required(),
      // Relationship field - User has one RV
      rv: a.hasOne("RV", "userId"),
    })
    .authorization((allow) => [allow.owner()]),

  RV: a
    .model({
      make: a.string().required(),
      model: a.string().required(),
      year: a.integer().required(),
      // Array of strings for photos
      photos: a.string().array(),
      // Reference field for User
      userId: a.string(),
      // Relationships
      user: a.belongsTo("User", "userId"),
      documents: a.hasMany("Document", "rvId"),
      maintenanceRecords: a.hasMany("MaintenanceRecord", "rvId"),
    })
    .authorization((allow) => [allow.owner()]),

  MaintenanceRecord: a
    .model({
      title: a.string().required(),
      date: a.datetime().required(),
      type: a.string().required(),
      notes: a.string(),
      // Array of strings for photos
      photos: a.string().array(),
      // Reference field for RV
      rvId: a.string(),
      // Relationships
      rv: a.belongsTo("RV", "rvId"),
      documents: a.hasMany("Document", "maintenanceRecordId"),
    })
    .authorization((allow) => [allow.owner()]),

  Document: a
    .model({
      title: a.string().required(),
      type: a.string().required(),
      url: a.string().required(),
      // Array of strings for tags
      tags: a.string().array(),
      // Reference fields for relationships
      rvId: a.string(),
      maintenanceRecordId: a.string(),
      // Relationships
      rv: a.belongsTo("RV", "rvId"),
      maintenanceRecord: a.belongsTo("MaintenanceRecord", "maintenanceRecordId"),
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
