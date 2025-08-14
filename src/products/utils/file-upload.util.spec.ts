import { BadRequestException } from '@nestjs/common';
import { imageFileFilter, editFileName } from './file-upload.util';

describe('File Upload Utils', () => {
  describe('imageFileFilter', () => {
    const mockCallback = jest.fn();

    beforeEach(() => {
      mockCallback.mockClear();
    });

    it('should accept valid image files', () => {
      const validFiles = [
        { originalname: 'test.jpg' },
        { originalname: 'test.jpeg' },
        { originalname: 'test.png' },
        { originalname: 'test.gif' },
        { originalname: 'TEST.JPG' },
      ];

      validFiles.forEach(file => {
        imageFileFilter(null, file, mockCallback);
        expect(mockCallback).toHaveBeenCalledWith(null, true);
        mockCallback.mockClear();
      });
    });

    it('should reject non-image files', () => {
      const invalidFiles = [
        { originalname: 'test.txt' },
        { originalname: 'test.pdf' },
        { originalname: 'test.doc' },
        { originalname: 'test.mp4' },
      ];

      invalidFiles.forEach(file => {
        imageFileFilter(null, file, mockCallback);
        expect(mockCallback).toHaveBeenCalledWith(
          expect.any(BadRequestException),
          false
        );
        mockCallback.mockClear();
      });
    });
  });

  describe('editFileName', () => {
    const mockCallback = jest.fn();

    beforeEach(() => {
      mockCallback.mockClear();
    });

    it('should generate unique filename with original extension', () => {
      const file = { originalname: 'test-image.jpg' };
      
      editFileName(null, file, mockCallback);
      
      expect(mockCallback).toHaveBeenCalledWith(
        null,
        expect.stringMatching(/^test-image-.+\.jpg$/)
      );
    });

    it('should handle files with no extension', () => {
      const file = { originalname: 'testimage' };
      
      editFileName(null, file, mockCallback);
      
      expect(mockCallback).toHaveBeenCalledWith(
        null,
        expect.stringMatching(/^testimage-.+$/)
      );
    });

    it('should handle files with multiple dots', () => {
      const file = { originalname: 'test.image.file.png' };
      
      editFileName(null, file, mockCallback);
      
      expect(mockCallback).toHaveBeenCalledWith(
        null,
        expect.stringMatching(/^test-.+\.png$/)
      );
    });
  });
});
