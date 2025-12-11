import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Counter from '../Counter';
import useCounterStore from '../../store/useCounterStore';

describe('Counter Component', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { reset } = useCounterStore.getState();
    reset();
  });

  it('should render counter with initial count of 0', () => {
    render(<Counter />);
    expect(screen.getByText(/count: 0/i)).toBeInTheDocument();
  });

  it('should increase count when increase button is clicked', () => {
    render(<Counter />);
    const increaseBtn = screen.getByText(/increase/i);
    fireEvent.click(increaseBtn);
    expect(screen.getByText(/count: 1/i)).toBeInTheDocument();
  });

  it('should decrease count when decrease button is clicked', () => {
    render(<Counter />);
    const decreaseBtn = screen.getByText(/decrease/i);
    fireEvent.click(decreaseBtn);
    expect(screen.getByText(/count: -1/i)).toBeInTheDocument();
  });

  it('should reset count when reset button is clicked', () => {
    render(<Counter />);
    const increaseBtn = screen.getByText(/increase/i);
    fireEvent.click(increaseBtn);
    fireEvent.click(increaseBtn);
    const resetBtn = screen.getByText(/reset/i);
    fireEvent.click(resetBtn);
    expect(screen.getByText(/count: 0/i)).toBeInTheDocument();
  });
});
