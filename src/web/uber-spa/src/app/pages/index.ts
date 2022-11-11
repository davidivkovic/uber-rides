import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgModel } from '@angular/forms';

@Component({
  standalone: true,
  imports: [RouterModule],
  template: ``,
})
export default class Index {
  printHello = () => console.log('Test');

  handleInput = (e) => {
    const input = e.target;
    if (e.keyCode == 8 && input.previousElementSibling) {
      input.value = '';
      input.previousElementSibling.focus();
    } else if (input.nextElementSibling && input.value) {
      input.nextElementSibling.focus();
    }
  };
  handlePaste = (e) => {
    const inputs = document
      .querySelector('form[name="verify-code"]')
      .querySelectorAll('input');
    const paste = e.clipboardData.getData('text');
    console.log(paste);
    inputs.forEach((input, i) => {
      input.value = paste[i] || '';
    });
  };
}
