import React from 'react';
import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';
import Loader from '../components/Loader';

const HomePage = ({ files, loading, onUploadSuccess }) => {
    return (
        <main>
            <FileUpload onUploadSuccess={onUploadSuccess} />
            {loading ? <Loader /> : <FileList files={files} />}
        </main>
    );
};

export default HomePage;