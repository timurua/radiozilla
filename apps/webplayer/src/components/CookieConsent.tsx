import { useSetRecoilState } from 'recoil';
import { cookieConsentState } from '../state/auth';
import LocalStorage from '../utils/LocalStorage';
import { Button, Card } from 'react-bootstrap';

export function CookieConsent(): JSX.Element | null {
    const setCookieConsent = useSetRecoilState(cookieConsentState);

    const updateConsent = (
        value: boolean
    ): void => {
        LocalStorage.setCookieConsent(value);
        setCookieConsent(value);
    };

    const acceptAll = (): void => {
        updateConsent(true);
    };

    return (
        <Card className="bg-dark text-white width-100">
            <Card.Body>
                <Card.Title>Cookie Consent</Card.Title>
                <Card.Text>
                    We use cookies and similar technologies to enable services and functionality.
                    We appologise for the inconvenience, but we need your consent to deliver full listening experience.
                </Card.Text>
                <Button
                    onClick={acceptAll}
                    variant="light"
                >
                    Accept All
                </Button>
            </Card.Body>
        </Card>
    );
}
