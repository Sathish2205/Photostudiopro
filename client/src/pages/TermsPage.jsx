export default function TermsPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold gradient-text">Terms of Service</h1>
            <div className="glass p-8 rounded-2xl space-y-4 text-dark-300">
                <p className="text-sm text-dark-500">Last updated: {new Date().toLocaleDateString()}</p>
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">1. Acceptance of Terms</h3>
                    <p>By accessing or using PhotoStudio Pro, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>

                    <h3 className="text-lg font-semibold text-white">2. Use License</h3>
                    <p>Permission is granted to temporarily download one copy of the materials (information or software) on PhotoStudio Pro's website for personal, non-commercial transitory viewing only.</p>

                    <h3 className="text-lg font-semibold text-white">3. Disclaimer</h3>
                    <p>The materials on PhotoStudio Pro's website are provided on an 'as is' basis. PhotoStudio Pro makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>

                    <h3 className="text-lg font-semibold text-white">4. Limitations</h3>
                    <p>In no event shall PhotoStudio Pro or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on PhotoStudio Pro's website.</p>
                </div>
            </div>
        </div>
    );
}
