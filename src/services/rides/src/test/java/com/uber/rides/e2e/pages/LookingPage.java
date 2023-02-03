package com.uber.rides.e2e.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class LookingPage {

    WebDriver driver;
    WebDriverWait wait;

    public LookingPage(WebDriver driver, WebDriverWait wait) {
        this.driver = driver;
        this.wait = wait;
    }

    public void navigate(String spaUrl) {
        driver.navigate().to(spaUrl + "/looking");
    }

    public void addStop() {
        var addStopButtonId = By.id("looking-add-stop-button");
        wait.until(ExpectedConditions.visibilityOfElementLocated(addStopButtonId));
        wait.ignoring(StaleElementReferenceException.class).until(ExpectedConditions.elementToBeClickable(addStopButtonId));
        driver.findElement(addStopButtonId).click();
    }

    public void fillLookingForm(String... addresses) {
        for (int i = 0; i < addresses.length; i++) {
            var inputId = By.id("stopover-input-" + i);
            wait.until(ExpectedConditions.visibilityOfElementLocated(inputId));
            var input = driver.findElement(inputId);
            input.sendKeys(addresses[i]);
            var locationXpath = By.xpath("//*[@id=\"locations-list\"]/div[2]");
            wait.until(ExpectedConditions.visibilityOfElementLocated(locationXpath));
            wait.ignoring(StaleElementReferenceException.class).until(ExpectedConditions.elementToBeClickable(locationXpath));
            driver.findElement(locationXpath).click();
            wait.until(ExpectedConditions.invisibilityOfElementLocated(locationXpath));
        }
    }

    public boolean hasError() {
        var errorId = By.id("looking-error");
        wait.until(ExpectedConditions.visibilityOfElementLocated(errorId));
        return driver.findElement(errorId).isDisplayed();
    }

    public boolean canContinue() {
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("distance-info")));
        var continueButtonId = By.id("looking-continue-button");
        wait.ignoring(StaleElementReferenceException.class).until(ExpectedConditions.elementToBeClickable(continueButtonId));
        return driver.findElement(continueButtonId).isEnabled();
    }

    public void continueToRide() {
        var continueButtonId = By.id("looking-continue-button");
        wait.ignoring(StaleElementReferenceException.class).until(ExpectedConditions.elementToBeClickable(continueButtonId));
        driver.findElement(continueButtonId).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("CAR_UBER_X")));
    }
    
}
