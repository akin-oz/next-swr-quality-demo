import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Alert } from '@/components/Alert';

describe('Alert', () => {
    it('announces errors and receives focus on mount', async () => {
        render(<Alert>Something went wrong</Alert>);

        const alert = await screen.findByRole('alert');

        expect(alert).toBeInTheDocument();
        expect(alert).toHaveAttribute('aria-live', 'assertive');
        expect(document.activeElement).toBe(alert);
    });
});