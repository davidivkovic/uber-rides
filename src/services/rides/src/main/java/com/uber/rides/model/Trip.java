package com.uber.rides.model;

import java.time.LocalDateTime;
import java.util.List;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Trip {

    // 1. REZERVISI SLOBODNOG VOZACA INTERNO
    // 2. PLATI U DVA KORAKA - SACUVAJ VOZNJU U BAZU - AKO DRUGI KORAK PLACANJA NE USPE OSLOBODI VOZACA
    // 3. NAREDI VOZACU TRENUTNU VOZNJU
    // 4. VOZAC DOLAZI NA PICKUP LOCACTION
    // 5. VOZAC ZAPOCINJE ILI OTKAZUJE VOZNJU UZ OPRAVDANJE

    enum Status {
        CREATED, PAID, AWAITING_PICKUP, IN_PROGRESS, CANCELLED, COMPLETED
    }

    @Id @GeneratedValue Long id;

    @OneToOne User rider;
    @OneToOne User driver;

    @OneToMany List<User> passengers;

    Status status;
    Route route;
    LocalDateTime timestamp;
    
    boolean scheduled;
    LocalDateTime scheduledAt;

    boolean cancelled;
    String cancellationReason;

}
