import { Component, signal } from '@angular/core';
import { NgxRoundSlider } from 'ngx-round-slider';
import { SliderModule } from 'primeng/slider';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-root',
  imports: [
    // angular
    FormsModule,

    // primeng
    SliderModule,
    TagModule,

    //components
    NgxRoundSlider,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  isDarkMode = signal(false);
  isDisabled = signal(false);

  withReference = signal({
    start: 0,
    end: 180,
    refStart: 0,
    refEnd: 360,
  });

  styles = {
    pathSelectedRange: 'stroke-primary-500 dark:stroke-primary-500 fill-transparent',
    pathSelectedRangeCone: 'fill-primary-300 dark:fill-primary-700 opacity-50',
    pathOutboundDashed: 'stroke-gray-300 dark:stroke-gray-600 fill-transparent',
    pathAllowedRangeBorder: 'stroke-gray-300 dark:stroke-surface-600 fill-transparent',
    pathAllowedRangeCenter: 'stroke-gray-200 dark:stroke-surface-800 fill-transparent',
    pathZeroLine: 'stroke-gray-400 fill-transparent',
    handler: 'fill-gray-700 dark:fill-gray-300 cursor-move',
  };

  constructor() {}

  onToggleTheme() {
    this.isDarkMode.set(!this.isDarkMode());
    document.documentElement.className = this.isDarkMode() ? 'app-dark' : 'app-light';
  }

  withReferenceChange() {
    console.log(this.withReference().start, this.withReference().end);
  }
}
