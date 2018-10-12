# SocialNetworkProject

This project is an attempt to create a social networking site with features like Create Post (can be text , image or video) , add comment to posts,
register new users / sign up and sign in , single user chat , search users , send friend requests

The site is designed using a combination on technologies :
Front-End : 
 - React and Apollo Graphql client for data exchange
 - Google Firebase Auth for user sign up  sign in
 - Google Firebase storage for storing img and videos
 
Back-end:
 - Node hosting a graphql server
 - Graphql subscriptions for real time updates 
 - Different databases for different functions like Mongo DB (m lab) for storing post , comment , user , chat related data . 
 - Neo4j for storing user relationship like friendship
 - Elastic search for storing user info for searching.
 - Kafka for synching user data between Mongo DB , neo4j and elastic search.
 
Note : Arch Diagram and app screenshots are under screenshots folder. 
