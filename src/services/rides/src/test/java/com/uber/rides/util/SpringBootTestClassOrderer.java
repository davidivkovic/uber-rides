package com.uber.rides.util;

import org.junit.jupiter.api.ClassDescriptor;
import org.junit.jupiter.api.ClassOrderer;
import org.junit.jupiter.api.ClassOrdererContext;

import java.util.Comparator;

public class SpringBootTestClassOrderer implements ClassOrderer {
    
    @Override
    public void orderClasses(ClassOrdererContext classOrdererContext) {
        var n =  classOrdererContext.getClassDescriptors().stream().map(ClassDescriptor::getDisplayName).toList();
        classOrdererContext.getClassDescriptors().sort(Comparator.comparingInt(SpringBootTestClassOrderer::getOrder));
    }

    private static int getOrder(ClassDescriptor classDescriptor) {
        if (classDescriptor.getDisplayName().contains("Data")) {
            return 2;
        }
        if (classDescriptor.getDisplayName().contains("E2ELogin")) {
            return 3;
        }
        if (classDescriptor.getDisplayName().contains("E2ETrip")) {
            return 4;
        }
        if (classDescriptor.getDisplayName().contains("Integration")) {
            return 5;
        }
        return 1;
    }
}
