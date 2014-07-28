hypermedia-api-generator 
===

Contents
---
 - Introduction
 - Key Concepts
 - Requirements
 - Installation
 - JSON API Definition
 - Steps to generate an API

Introduction
---

The Hypermedia API generator is an API written in Node JS that lets you go from modeling your API to deployment in one easy step. It automatically creates and deploys functional REST APIs based on a simple JSON definition file.

There are a number of key goals for this project. They fall into the following cateogries:
 - Provide foundational ability to create *real* applications without code
 - Make building a functional application as easy, flexible and powerful as using a spreadsheet
 - Demonstrate applicability and usefulness of the optional REST constraint: Code-On-Demand
 - Enable ad hoc capabilities for emergent devices and networks (IoT)
 - Create useful clients that can be applied to any API given a known media-type and a set of 'knowable' semantic profiles 
 - Creat a powerful toolset that will be used as a building block of robust, distributed applications.
 
Key Concepts
---

 - HATEOAS
 - Applied API Interface and Design Patterns (NARWHL)
 - Resource Relationships
 - Code On Demand

Requirements
---

 - Node JS
 - NPM
 - MongoDB
 
Installation
---

 1. Make sure you have Node JS and MongoDB installed, and that mongod is running (this supports the generated APIs).
 2. '$ npm install'
 3. '$ node server'
 4. The API should now be running on localhost port 5000


Steps to generate an API
---

Once you have installed the Hypermedia API generator and it is running (see installation instructions above), you can start generating APIs. The basic process works as follows:

1. Name your API and define your API resources, and their relationships
2. Create a JSON API definition which details the information above (link)
3. POST the JSON API definition to the root of the running API (e.g. POST http://localhost:5000/)
4. If your API definition file was valid, in a few moments a new directory will be created with the name of your new API.
5. Open a new terminal window and navigate to the directory where the new API was created.
6. '$ node server' (must make sure mongod is running)
7. That's it! Your new API is now up and running.

JSON API Definition
---

At the core of the Hypermedia API Generator is the JSON API definition which is all you need to create and deploy a REST API. It has 3 parts to it:
 1. Meta-information
 2. Resource hierarchy
 3. Resource definitions
 

