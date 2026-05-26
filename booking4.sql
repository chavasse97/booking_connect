CREATE TABLE `users`(
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` CHAR(255) NOT NULL,
    `surname` CHAR(255) NOT NULL,
    `phone` CHAR(255) NOT NULL UNIQUE,
    `email` CHAR(255) NOT NULL UNIQUE
);
CREATE TABLE `properties`(
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` CHAR(255) NOT NULL,
    `city` CHAR(255) NOT NULL,
    `address` CHAR(255) NOT NULL,
    `description` CHAR(255) NOT NULL
);
CREATE TABLE `roomtypes`(
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `title` CHAR(255) NOT NULL,
    `price` FLOAT(53) NOT NULL,
    `capacity` INT NOT NULL,
    `property_id` INT NOT NULL
);
CREATE TABLE `rooms`(
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `property_id` INT NOT NULL,
    `roomtype_id` INT NOT NULL,
    `roomnumber` INT NOT NULL,
    `status` CHAR(255) NOT NULL
);
CREATE TABLE `availability`(
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `room_id` INT NOT NULL,
    `date` DATE NOT NULL,
    `isbooked` BOOLEAN NOT NULL
);
CREATE TABLE `bookings`(
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `room_id` INT NOT NULL,
    `checkindate` DATE NOT NULL,
    `checkoutdate` DATE NOT NULL,
    `status` CHAR(255) NOT NULL
);
ALTER TABLE roomtypes
ADD FOREIGN KEY(property_id) REFERENCES properties(id)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE rooms
ADD FOREIGN KEY(roomtype_id) REFERENCES roomtypes(id)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE rooms
ADD FOREIGN KEY(property_id) REFERENCES properties(id)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE availability
ADD FOREIGN KEY(user_id) REFERENCES users(id)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE availability
ADD FOREIGN KEY(room_id) REFERENCES rooms(id)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE bookings
ADD FOREIGN KEY(user_id) REFERENCES users(id)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE bookings
ADD FOREIGN KEY(room_id) REFERENCES rooms(id)
ON UPDATE NO ACTION ON DELETE NO ACTION;