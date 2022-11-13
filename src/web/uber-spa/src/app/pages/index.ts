import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterModule],
  template: `<div>
    <img
      alt="Cover image"
      class="h-[660px] w-full object-cover"
      src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,w_3136,h_1334/v1653688465/assets/29/74ec2f-a727-47e1-9695-c78f8dadee5f/original/DotCom_Update_Earner_bg2x.jpg"
    />
    <div class="w-[1100px] mx-auto gap-12 flex mt-10 mb-20">
      <div class="cursor-pointer w-1/2 hover:opacity-70 transition duration-75">
        <div
          class="flex justify-between items-center border-b border-black pb-11"
        >
          <h2 class="font-bold text-4xl p-1">Sign up to drive &amp; deliver</h2>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path
              d="M22.2 12l-6.5 9h-3.5l5.5-7.5H2v-3h15.7L12.2 3h3.5l6.5 9z"
              fill="currentColor"
            ></path>
          </svg>
        </div>
      </div>
      <div
        class="group cursor-pointer w-1/2 hover:opacity-70 transition duration-75"
      >
        <div
          class="flex justify-between items-center border-b border-black pb-11"
        >
          <h2 class="font-bold text-4xl p-1">Sign up to ride</h2>
          <div class="h-8 w-8 overflow-hidden">
            <div class="flex w-max space-x-8 -translate-x-16">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                class="group-hover:translate-x-[67px]  duration-700"
              >
                <path
                  d="M22.2 12l-6.5 9h-3.5l5.5-7.5H2v-3h15.7L12.2 3h3.5l6.5 9z"
                  fill="currentColor"
                ></path>
              </svg>
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                class="group-hover:translate-x-10 transition duration-500"
              >
                <path
                  d="M22.2 12l-6.5 9h-3.5l5.5-7.5H2v-3h15.7L12.2 3h3.5l6.5 9z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`,
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
