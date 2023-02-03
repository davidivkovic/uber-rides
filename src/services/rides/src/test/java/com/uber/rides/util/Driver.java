package com.uber.rides.util;

import java.time.Duration;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class Driver {

    public static WebDriver driver;
    public static WebDriverWait wait;

    static {
        System.setProperty("webdriver.chrome.driver", "chromedriver");
        driver = new ChromeDriver(new ChromeOptions().setHeadless(true));
        wait = new WebDriverWait(driver, Duration.ofSeconds(20));
    }

}
