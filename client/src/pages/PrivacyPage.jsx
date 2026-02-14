export default function PrivacyPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold gradient-text">Privacy Policy</h1>
            <div className="glass p-8 rounded-2xl space-y-4 text-dark-300">
                <p className="text-sm text-dark-500">Last updated: {new Date().toLocaleDateString()}</p>
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">1. Information We Collect</h3>
                    <p>We collect information you provide directly to us, such as when you create an account, update your profile, or use our services to manage your photography business. This includes client data, event details, and financial records.</p>

                    <h3 className="text-lg font-semibold text-white">2. How We Use Your Information</h3>
                    <p>We use the information we collect to provide, maintain, and improve our services, including:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Facilitating client management and event scheduling.</li>
                        <li>Processing financial records and generating reports.</li>
                        <li>Sending you technical notices, updates, and support messages.</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-white">3. Data Security</h3>
                    <p>We implement appropriate technical and organizational measures to protect the security of your personal information. However, please note that no method of transmission over the Internet or method of electronic storage is 100% secure.</p>

                    <h3 className="text-lg font-semibold text-white">4. Contact Us</h3>
                    <p>If you have any questions about this Privacy Policy, please contact us via the Support page.</p>
                </div>
            </div>
        </div>
    );
}
