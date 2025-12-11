import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FileUpload from '../FileUpload';
import { AuthProvider } from '../../context/AuthContext';

describe('FileUpload Component', () => {
  it('should render FileUpload with Trigger button', () => {
    render(
      <AuthProvider>
        <FileUpload>
          <FileUpload.Trigger>파일 선택</FileUpload.Trigger>
          <FileUpload.List />
        </FileUpload>
      </AuthProvider>
    );
    expect(screen.getByText('파일 선택')).toBeInTheDocument();
  });

  it('should render dropzone with accessible attributes', () => {
    render(
      <AuthProvider>
        <FileUpload>
          <FileUpload.Dropzone>
            <p>파일을 드래그하세요</p>
          </FileUpload.Dropzone>
        </FileUpload>
      </AuthProvider>
    );
    const dropzone = screen.getByLabelText(/파일 업로드 드롭존/i);
    expect(dropzone).toBeInTheDocument();
    expect(dropzone).toHaveAttribute('role', 'button');
    expect(dropzone).toHaveAttribute('tabIndex', '0');
  });

  it('should not render submit button when no files are added', () => {
    render(
      <AuthProvider>
        <FileUpload>
          <FileUpload.Submit />
        </FileUpload>
      </AuthProvider>
    );
    const submitBtn = screen.queryByText(/파일 업로드/i);
    expect(submitBtn).not.toBeInTheDocument();
  });

  it('should render upload button with accessible label', () => {
    render(
      <AuthProvider>
        <FileUpload>
          <FileUpload.Trigger aria-label="파일 선택">선택</FileUpload.Trigger>
        </FileUpload>
      </AuthProvider>
    );
    const trigger = screen.getByRole('button', { name: /파일 선택/i });
    expect(trigger).toBeInTheDocument();
  });
});
