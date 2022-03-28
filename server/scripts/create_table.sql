CREATE TABLE events (
    `EventID` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `EventTitle` varchar(255),
    `StartDateTime` DATETIME,
    `ExpiryDateTime` DATETIME,
    `Description` varchar(255),
    `ContactEmail` varchar(255),
    `ContactTelephone` varchar(13),
    `GeoLocation` POINT,
    `Tags` JSON DEFAULT NULL
)