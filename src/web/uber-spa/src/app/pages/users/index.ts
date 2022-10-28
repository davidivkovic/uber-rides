import { Component } from "@angular/core"
import { computed, watchEffect } from "src/app/utils"
import { NgIf, NgForOf } from "@angular/common"
import { FormsModule } from "@angular/forms";

@Component({
    standalone: true,
    imports: [NgIf, NgForOf, FormsModule],
    template: `
        <div>Hello from users/index.ts</div>
        <div>Counter: {{ counter }}</div>
        <div>Double Counter: {{ doubleCounter() }}</div>
        <div *ngIf="counter % 2 == 0; else: elseBlock">Number is Even!</div>
        <ng-template #elseBlock>
            <div> Number is Odd!</div>
        </ng-template>
        <button (click)="increment()" class="bg-indigo-100 p-2">Increment</button>
        <div *ngFor="let name of names; trackBy: trackFn">{{ name.name }}</div>

        <input [(ngModel)]="name" #ctrl="ngModel" required>

        <p>Value: {{ name }}</p>
        <p>Valid: {{ ctrl.valid }}</p>

        <button (click)="setValue()">Set value</button>
        {{ watch() }}
    `
})
export class Index {

    name: string = ''

    setValue() {
      this.name = 'Nancy'
    }

    counter = 0
    names = [{id: 0, name: 'David'}, {id:1, name: 'Milica'}]
    stopWatchingMe = () => {} 

    increment = () => { 
        this.counter++  
        if (this.counter >= 10) this.stopWatchingMe() 
    }

    addToList = () => this.names = [...this.names, ({id: new Date().getMilliseconds(), name: 'John'})]
    doubleCounter = computed(() => this.counter, () => this.counter * 2)

    counterWatcher = watchEffect(() => this.counter, (prev, curr) => console.log({prev, curr}), {}, stopFn => this.stopWatchingMe = stopFn)
    // doubleCounterWatcher = watchEffect(this.doubleCounter, (doublePrev, doubleCurr) => console.log({doublePrev, doubleCurr}))

    watch = () => {
        this.counterWatcher()
        // this.doubleCounterWatcher()
    }

    trackFn = (index, item: {id: number, name: string}) => item.id

    constructor () {
        setInterval(this.increment, 1000)
    }

}