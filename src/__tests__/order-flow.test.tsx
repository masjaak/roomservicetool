import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProductCard } from '../components/ProductCard';

const mockItem = {
  id: 'test-1',
  name: 'Test Item',
  description: 'Test Description',
  price: 150000,
  category: 'Mains',
  image: '/test.jpg'
};

describe('ProductCard UI Expectations', () => {
  it('explicitly renders a direct Add button', () => {
    const clickSpy = vi.fn();
    render(<ProductCard item={mockItem} onClick={clickSpy} freeLabel="Free" />);

    // Since the new rule specifies making CTA explicitly obvious
    const addBtn = screen.getByText('Add');
    expect(addBtn).toBeDefined();

    fireEvent.click(addBtn);
    expect(clickSpy).toHaveBeenCalled();
  });
});
