import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-red-900 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
                        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
                        <div className="text-gray-700 mb-4">
                            <p className="font-semibold">Error:</p>
                            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                                {this.state.error?.toString() || 'Unknown error occurred'}
                            </pre>
                        </div>
                        <div className="text-gray-700 mb-4">
                            <p className="font-semibold">Component Stack:</p>
                            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                                {this.state.errorInfo?.componentStack || 'No component stack available'}
                            </pre>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
