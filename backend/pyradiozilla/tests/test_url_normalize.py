import unittest
import sys
import os

# Add the directory containing pyradiozilla to the system path
from pyradiozilla import url_normalize

class TestUrlNormalize(unittest.TestCase):

    def test_normalize_preserving_semantics(self):
        self.assertEqual(
            url_normalize.normalize_preserving_semantics('HTTP://www.Example.com/'),
            'http://www.example.com/'
        )
        self.assertEqual(
            url_normalize.normalize_preserving_semantics('http://www.example.com/a/./b/../c/'),
            'http://www.example.com/a/c/'
        )
        self.assertEqual(
            url_normalize.normalize_preserving_semantics('http://www.example.com:80/'),
            'http://www.example.com/'
        )

    def test_normalize_usually_preserving_semantics(self):
        self.assertEqual(
            url_normalize.url_normalize.normalize_usually_preserving_semantics('http://www.example.com/path'),
            'http://www.example.com/path/'
        )
        self.assertEqual(
            url_normalize.normalize_usually_preserving_semantics('http://www.example.com/path/'),
            'http://www.example.com/path/'
        )

    def test_normalize_changing_semantics(self):
        self.assertEqual(
            url_normalize.normalize_changing_semantics('http://www.example.com/index.html'),
            'http://example.com/'
        )
        self.assertEqual(
            url_normalize.normalize_changing_semantics('http://www.example.com//a//b//'),
            'http://example.com/a/b/'
        )
        self.assertEqual(
            url_normalize.normalize_changing_semantics('http://www.example.com/?b=2&a=1'),
            'http://example.com/?a=1&b=2'
        )
        self.assertEqual(
            url_normalize.normalize_changing_semantics('http://www.example.com/#fragment'),
            'http://example.com/'
        )

if __name__ == '__main__':
    unittest.main()