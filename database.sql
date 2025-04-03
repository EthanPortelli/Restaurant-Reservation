CREATE DATABASE restaurantDatabase;

GRANT ALL PRIVILEGES ON restaurantDatabase.* TO 'testuser'@'localhost' IDENTIFIED BY '1234';
FLUSH PRIVILEGES;

USE restaurantDatabase;

CREATE TABLE Users(
    userID int NOT NULL AUTO_INCREMENT,
    userName varchar(255) NOT NULL UNIQUE,
    userPassword varchar(255) NOT NULL,
    firstName varchar(255) NOT NULL,
    lastName varchar(255) NOT NULL,
    emailAddress varchar(255) NOT NULL,
    PRIMARY KEY (userID)
);

CREATE TABLE Tables(
    tableID int NOT NULL AUTO_INCREMENT,
    tableSeats varchar(255) NOT NULL,
    tableStatus varchar(255) NOT NULL,
    tableSeats varchar(255) NOT NULL,
    PRIMARY KEY (tableID)
);

CREATE TABLE Reservations(
    reservationID int NOT NULL AUTO_INCREMENT,
    userID int NOT NULL,
    tableID int NOT NULL,
    PRIMARY KEY (reservationID)
    FOREIGN KEY(userID) REFERENCES Users (userID)
    FOREIGN KEY(tableID) REFERENCES Tables (tableID)
);




/*
CREATE TABLE usersInfo(
    userID int NOT NULL AUTO_INCREMENT,
    userName varchar(255) NOT NULL UNIQUE,
    firstName varchar(255) NOT NULL,
    lastName varchar(255) NOT NULL,
    dob Date NOT NULL,
    emailAddress varchar(255) NOT NULL,
    userPassword varchar(255) NOT NULL,
    zipcode varchar(5) NOT NULL,
    city varchar(255) NOT NULL,
    PRIMARY KEY (userID)
);


CREATE TABLE lostPets(
    lostID  int NOT NULL AUTO_INCREMENT,
    userID int NOT NULL,
    dateCreated DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    dateLost Date NOT NULL,
    lastZipcode varchar(5) NOT NULL,
    lastCityID varchar(255) NOT NULL,
    petName varchar(255) NOT NULL,
    animalType ENUM('Bird', 'Cat', 'Chickens', 'Dog', 'Ferrets', 'Gerbils', 'Guinea Pigs', 'Hamster', 'Mice', 'Turtles','Reptiles') NOT NULL,
    animalSize ENUM('XS','S','M','L','XL','XXL') NOT NULL,
    animalColor ENUM('Black', 'Blue', 'Brown', 'Gray', 'Green', 'Orange', 'Red', 'Silver', 'Tan', 'White', 'Yellow') NOT NULL,
    animalGender ENUM('Female','Male') NOT NULL,
    animal_image_path varchar(255),  
    description varchar(255),
    status ENUM('Found','Lost') NOT NULL, 
    PRIMARY KEY (lostID),
    FOREIGN KEY(userID) REFERENCES usersInfo (userID)
);

CREATE TABLE foundPets(
    foundID int NOT NULL AUTO_INCREMENT,
    lostID int NOT NULL,
    dateFound date NOT NULL,
    status ENUM('Lost','Found') NOT NULL,
    PRIMARY KEY(foundID),
    FOREIGN KEY(lostID) REFERENCES lostPets(lostID)  
);

CREATE TABLE postComments(
    commentID int NOT NULL AUTO_INCREMENT,
    lostID int NOT NULL,
    dateCreated DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    commentText varchar(255) NOT NULL,
    userID int NOT NULL, 
    PRIMARY KEY (commentID),
    FOREIGN KEY(lostID) REFERENCES lostPets(lostID),
    FOREIGN KEY (userID) REFERENCES usersInfo(userID)
);

CREATE TABLE donations(
    donationID int NOT NULL AUTO_INCREMENT,
    userID int NOT NULL,
    dateCreated DateTime DEFAULT NOW(),
    zipcode varchar(5) NOT NULL, 
    itemStatus ENUM('Available','Pending','Claimed') NOT NULL, 
    itemCategory ENUM('Bedding','Clothing','Grooming Supplies','Leashes & Collars','Litter & Waste Supplies','Medical Supplies','Toys','Transport Supplies') NOT NULL,
    itemName varchar(255) NOT NULL,
    quantity int NOT NULL,
    itemCondition ENUM('New','Like New', 'Gently Used', 'Used', 'Worn') NOT NULL,
    itemDescription varchar(255) NOT NULL,
    item_image_path varchar(255), 
    PRIMARY KEY (donationID),
    FOREIGN KEY(userID) REFERENCES usersInfo (userID)
);
*/
