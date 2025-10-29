import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Alert, type AlertProps } from './Alert';

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  args: {
    title: 'Example',
    children: 'Something happened',
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<typeof Alert>;

export const Error: Story = {
  name: 'Error (role=alert)',
  args: {
    severity: 'error',
    role: 'alert',
  } as AlertProps,
};

export const Warning: Story = {
  args: {
    severity: 'warning',
    role: 'status',
    title: 'Be careful',
    children: 'This is a warning message.',
  } as AlertProps,
};

export const Info: Story = {
  args: {
    severity: 'info',
    role: 'status',
    title: 'Heads up',
    children: 'Here is some information.',
  } as AlertProps,
};

export const Success: Story = {
  args: {
    severity: 'success',
    role: 'status',
    title: 'All good',
    children: 'Operation completed successfully.',
  } as AlertProps,
};
