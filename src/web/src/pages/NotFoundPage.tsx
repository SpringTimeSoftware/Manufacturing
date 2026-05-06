import { Link } from "react-router-dom";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";

export function NotFoundPage() {
  return (
    <div className="app-splash">
      <Card title="Route not found" description="The requested workspace route does not exist in the current web foundation batch.">
        <Link to="/login">
          <Button variant="primary">Return to login</Button>
        </Link>
      </Card>
    </div>
  );
}
