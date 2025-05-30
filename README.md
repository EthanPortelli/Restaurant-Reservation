# Restaurant-Reservation
A reservation system for restaurant tables, created as a locally hosted website using NodeJs, Express, Mariadb, etc. It 
uses Async Mutex to prevent synchronization issues / race conditions (Express → TCP)

This is the enhanced version of the project. Newly fully implemented features: A map to keep track of mutexes, synchronization handling (async mutex) 
and related error handling, as well as additional checks in the SQL to prevent errors. Given more time, perhaps I would implement some scalability
to this project. 

In order to run it, you would have to install NodeJs and MariaDb. Once installed, 
run the database.sql file in HeidiSQL (a frontend interface that is installed with Mariadb) to set up the database. 
Also, create a few tables for customers to reserve in the Tables table. 
Once that's all done, open the file in terminal and run the command "node App.js" to start up the backend server. 
The localhost link will appear to the website in the terminal, CTRL+CLICK it to be redirected to said website.

Once on the website, you can login and register an account. To use the website, you must be logged in. 
After logging in, you will be on the main page. On this page, all of the tables of this restaurant are displayed. 
If a table is available, a button will appear next to it that you can click to reserve said table. If it is claimed, 
no button will appear as someone else has already reserved it. On the top of the page, you can click "Your Reservations" 
to be redirected to your Account Information Page. On this page, your Username and Reservations are displayed. Next to
each of your reservations is a button to cancel that reservation. When clicked, it will remove your reservation from the
database and set the status of the table from "Claimed" to "Available", so that a reservation button will appear next to it 
on the main page once more. To go back to the home page, click "Home" on the top of the tape. 

To sign out, simply click "Sign Out" on the top of the main/account pages.

Github Repository: https://github.com/EthanPortelli/Restaurant-Reservation
