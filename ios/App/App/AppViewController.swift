import UIKit
import WebKit
import Capacitor

final class AppViewController: CAPBridgeViewController {
    private let startupBackgroundColor = UIColor(red: 0.051, green: 0.047, blue: 0.043, alpha: 1)

    override func viewDidLoad() {
        super.viewDidLoad()
        applyStartupBackground()
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        applyStartupBackground()
    }

    private func applyStartupBackground() {
        view.backgroundColor = startupBackgroundColor
        webView?.isOpaque = false
        webView?.backgroundColor = startupBackgroundColor
        webView?.scrollView.backgroundColor = startupBackgroundColor
    }
}
