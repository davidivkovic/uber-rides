package com.uber.rides.e2e.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class ChooseRidePage {

    WebDriver driver;
    WebDriverWait wait;

    public ChooseRidePage(WebDriver driver, WebDriverWait wait) {
        this.driver = driver;
        this.wait = wait;
    }

    public void navigate(String spaUrl) {
        driver.navigate().to(spaUrl + "/looking/choose-ride");
    }

    public void selectCar(String carType) {
        var carXpath = By.id("CAR_" + carType);
        wait.until(ExpectedConditions.visibilityOfElementLocated(carXpath));
        wait.ignoring(StaleElementReferenceException.class).until(ExpectedConditions.elementToBeClickable(carXpath));
        driver.findElement(carXpath).click();
    }

    public void orderRide() {
        var requestRideButtonId = By.id("request-ride-button");
        wait.until(ExpectedConditions.visibilityOfElementLocated(requestRideButtonId));
        wait.ignoring(StaleElementReferenceException.class).until(ExpectedConditions.elementToBeClickable(requestRideButtonId));
        driver.findElement(requestRideButtonId).click();
        var cancelRideButtonId = By.id("cancel-request-ride-button");
        wait.until(ExpectedConditions.visibilityOfElementLocated(cancelRideButtonId));
    }

    public boolean hasNotBeenRedirected() {
        var requestRideButtonId = By.id("request-ride-button");
        wait.until(ExpectedConditions.visibilityOfElementLocated(requestRideButtonId));
        wait.ignoring(StaleElementReferenceException.class).until(ExpectedConditions.elementToBeClickable(requestRideButtonId));
        return driver.findElement(requestRideButtonId).isDisplayed();
    }

    public boolean hasBeenRedirected() {
        wait.until((d) -> !d.getCurrentUrl().contains("/looking/choose-ride"));
        return !driver.getCurrentUrl().contains("/looking/choose-ride");
    }
}
