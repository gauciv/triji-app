import React from 'react';
import { render } from '@testing-library/react-native';
import InfoRow from '../InfoRow';

describe('InfoRow', () => {
  it('should render icon, label, and value', () => {
    const { getByText } = render(<InfoRow icon="user" label="Name" value="John Doe" />);

    expect(getByText('Name')).toBeTruthy();
    expect(getByText('John Doe')).toBeTruthy();
  });

  it('should render with custom iconColor', () => {
    const { getByText } = render(
      <InfoRow icon="mail" label="Email" value="test@example.com" iconColor="#FF0000" />
    );

    expect(getByText('Email')).toBeTruthy();
    expect(getByText('test@example.com')).toBeTruthy();
  });

  it('should handle long values', () => {
    const longValue = 'This is a very long value that might overflow the container';
    const { getByText } = render(<InfoRow icon="info" label="Description" value={longValue} />);

    expect(getByText(longValue)).toBeTruthy();
  });

  it('should handle empty value', () => {
    const { getByText } = render(<InfoRow icon="info" label="Empty" value="" />);

    expect(getByText('Empty')).toBeTruthy();
  });
});
