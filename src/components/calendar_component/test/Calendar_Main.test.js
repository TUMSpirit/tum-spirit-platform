import React from 'react';
import Calendar_Main from '../Calendar_Main'
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

test('Create Event',  () => {
        render(<Calendar_Main/>)
    expect(screen.getByText('+ add Event')).toBeInTheDocument();

})