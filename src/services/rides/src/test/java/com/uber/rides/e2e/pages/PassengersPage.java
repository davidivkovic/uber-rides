package com.uber.rides.e2e.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class PassengersPage {

    WebDriver driver;
    WebDriverWait wait;

    public PassengersPage(WebDriver driver, WebDriverWait wait) {
        this.driver = driver;
        this.wait = wait;
    }

    public boolean driverDetailsAreDisplayed() {
        var driverDetailsId = By.id("driver-details");
        wait.until(ExpectedConditions.visibilityOfElementLocated(driverDetailsId));
        return driver.findElement(driverDetailsId).isDisplayed();
    }

    public boolean pickupIndicatorIsDisplayed() {
        var pickupIndicatorId = By.id("trip-pickup-indicator");
        wait.until(ExpectedConditions.visibilityOfElementLocated(pickupIndicatorId));
        return driver.findElement(pickupIndicatorId).isDisplayed();
    }

    public boolean reviewDialogIsDisplayed() {
        var reviewDialogId = By.id("review-driver-dialog");
        wait.until(ExpectedConditions.visibilityOfElementLocated(reviewDialogId));
        return driver.findElement(reviewDialogId).isDisplayed();
    }

}