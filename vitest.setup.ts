import '@testing-library/jest-dom/vitest';

class MockPointerEvent extends MouseEvent {
  pointerId = 1;
  width = 1;
  height = 1;
  pressure = 0.5;
  tangentialPressure = 0;
  tiltX = 0;
  tiltY = 0;
  twist = 0;
  pointerType = 'mouse';
  isPrimary = true;
}

if (!window.PointerEvent) {
  window.PointerEvent = MockPointerEvent as typeof PointerEvent;
}
