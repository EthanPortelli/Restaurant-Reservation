CREATE DATABASE restaurantDatabase;

GRANT ALL PRIVILEGES ON restaurantDatabase.* TO 'testuser'@'localhost' IDENTIFIED BY '1234';
FLUSH PRIVILEGES;

USE restaurantDatabase;

CREATE TABLE Users(
    userID int NOT NULL AUTO_INCREMENT,
    userName varchar(255) NOT NULL UNIQUE,
    userPassword varchar(255) NOT NULL,
    PRIMARY KEY (userID)
);

CREATE TABLE Tables(
    tableID int NOT NULL AUTO_INCREMENT,
    tableSeats int NOT NULL,
    tableStatus ENUM('Available','Claimed') NOT NULL,
    PRIMARY KEY (tableID)
);

CREATE TABLE Reservations(
    reservationID int NOT NULL AUTO_INCREMENT,
    userID int NOT NULL,
    tableID int NOT NULL,
    PRIMARY KEY (reservationID),
    FOREIGN KEY(userID) REFERENCES Users (userID),
    FOREIGN KEY(tableID) REFERENCES Tables (tableID)
);

